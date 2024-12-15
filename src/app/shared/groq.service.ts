import { Injectable } from '@angular/core';
import Groq from 'groq-sdk';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: 'YOUR_API_KEY', //TODO - put in .env
      dangerouslyAllowBrowser: true, // needed for browser
    });
  }

  // TODO - move groq apis to backend proxy server

  transcribeAudio(audioFile: File): Observable<string> {
    return from(
      new Promise<string>(async (resolve, reject) => {
        try {
          const transcription = await this.groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3',
            language: 'en',
            temperature: 0.0,
          });
          resolve(transcription.text);
        } catch (error) {
          reject(error);
        }
      })
    );
  }

  summarizeTranscription(transcription: string): Observable<string> {
    return from(
      new Promise<string>(async (resolve, reject) => {
        try {
          const completion = await this.groq.chat.completions.create({
            messages: [
              {
                role: 'user',
                content:
                  'summarize the transcription of this podcast with key points and concise details about the main topics: ' +
                  transcription,
              },
            ],
            model: 'llama3-8b-8192',
          });
          const summary = completion.choices[0].message.content;
          if (summary) {
            resolve(summary);
          } else {
            reject(new Error('Error generating Summary'));
          }
        } catch (error) {
          reject(error);
        }
      })
    );
  }
}

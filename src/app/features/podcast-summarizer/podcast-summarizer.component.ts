import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroqService } from '../../shared/groq.service';

@Component({
  selector: 'app-podcast-summarizer',
  imports: [FormsModule],
  templateUrl: './podcast-summarizer.component.html',
  styleUrl: './podcast-summarizer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodcastSummarizerComponent {
  selectedFile: File | null = null;
  isDragging = signal(false);
  isProcessing = signal(false);
  summary = signal('');

  constructor(private groqService: GroqService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  processAudio() {
    if (!this.selectedFile) return;

    this.isProcessing.set(true);
    this.summary.set('Transcribing audio...');

    this.groqService.transcribeAudio(this.selectedFile).subscribe({
      next: (transcription) => {
        this.summary.set('Generating summary...');
        this.groqService.summarizeTranscription(transcription).subscribe({
          next: (summary) => {
            this.summary.set(summary);
            this.isProcessing.set(false);
          },
          error: (error) => {
            this.summary.set(`Error generating summary: ${error.message}`);
            this.isProcessing.set(false);
          },
        });
      },
      error: (error) => {
        this.summary.set(`Error transcribing audio: ${error.message}`);
        this.isProcessing.set(false);
      },
    });
  }
}

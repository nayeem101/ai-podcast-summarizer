import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/podcast-summarizer/podcast-summarizer.component').then(
        (c) => c.PodcastSummarizerComponent
      ),
  },
];

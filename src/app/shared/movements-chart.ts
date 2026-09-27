import { Component, effect, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { LanguageService } from '../core/i18n/language.service';
import { ThemeService } from '../core/theme.service';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface DailyPoint {
  date: string;
  in: number;
  out: number;
}

@Component({
  selector: 'app-movements-chart',
  template: '<canvas #canvas aria-label="Stock movements chart" role="img"></canvas>',
  styles: ':host { display: block; position: relative; height: 280px; }',
})
export class MovementsChart implements OnDestroy {
  readonly data = input.required<DailyPoint[]>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly theme = inject(ThemeService);
  private chart?: Chart;

  constructor() {
    effect(() => {
      const points = this.data();
      const lang = this.language.current();
      const dark = this.theme.dark();
      this.render(points, lang, dark);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(points: DailyPoint[], lang: string, dark: boolean): void {
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--mat-sys-primary').trim() || '#6d28d9';
    const tertiary = styles.getPropertyValue('--mat-sys-tertiary').trim() || '#0891b2';
    const text = dark ? '#cbd5e1' : '#475569';
    const grid = dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)';
    const formatter = new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric' });

    this.chart?.destroy();
    this.chart = new Chart(this.canvas().nativeElement, {
      type: 'bar',
      data: {
        labels: points.map((p) => formatter.format(new Date(`${p.date}T12:00:00`))),
        datasets: [
          {
            label: this.translate.instant('dashboard.in'),
            data: points.map((p) => p.in),
            backgroundColor: tertiary,
            borderRadius: 6,
          },
          {
            label: this.translate.instant('dashboard.out'),
            data: points.map((p) => p.out),
            backgroundColor: primary,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: text, usePointStyle: true } } },
        scales: {
          x: { ticks: { color: text }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { color: grid } },
        },
      },
    });
  }
}

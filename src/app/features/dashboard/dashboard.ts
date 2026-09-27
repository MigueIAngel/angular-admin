import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/i18n/language.service';
import { DashboardSummary } from '../../core/models';
import { MovementsChart } from '../../shared/movements-chart';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MovementsChart,
    TranslatePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly language = inject(LanguageService);
  protected readonly summary = httpResource<DashboardSummary>(
    () => `${environment.apiUrl}/dashboard/summary`,
  );

  protected readonly kpis = computed(() => {
    const data = this.summary.value();
    if (!data) return [];
    return [
      {
        label: 'dashboard.products',
        value: data.totalProducts,
        icon: 'inventory_2',
        tone: 'primary',
      },
      {
        label: 'dashboard.suppliers',
        value: data.totalSuppliers,
        icon: 'local_shipping',
        tone: 'tertiary',
      },
      { label: 'dashboard.lowStock', value: data.lowStockCount, icon: 'warning', tone: 'error' },
    ];
  });
}

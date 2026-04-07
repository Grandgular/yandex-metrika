import { Component, inject } from '@angular/core';
import { YMInitService, YMService } from '../../../yandex-metrika/src/public-api';

@Component({
  selector: 'app-consent-demo',
  standalone: true,
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Демонстрация отложенной инициализации Метрики</h2>
      
      @if (!consentGiven) {
        <div style="border: 2px solid #f39c12; padding: 15px; border-radius: 8px; background: #fef5e7;">
          <h3>🍪 Cookie Banner</h3>
          <p>Мы используем аналитику для улучшения сайта. Разрешите использование cookies?</p>
          <button 
            (click)="acceptConsent()" 
            style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            ✓ Принять
          </button>
          <button 
            (click)="rejectConsent()" 
            style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ✗ Отклонить
          </button>
        </div>
      } @else {
        <div style="border: 2px solid #27ae60; padding: 15px; border-radius: 8px; background: #eafaf1; margin-bottom: 20px;">
          <p>✓ Согласие получено. Метрика инициализирована.</p>
        </div>

        <div style="margin-top: 20px;">
          <h3>Тестирование событий</h3>
          <button 
            (click)="trackGoal()" 
            style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Отправить цель
          </button>
          <button 
            (click)="trackPageView()" 
            style="padding: 10px 20px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Отправить просмотр
          </button>
        </div>
      }

      <div style="margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 4px;">
        <h4>Инструкция:</h4>
        <ol style="margin: 10px 0;">
          <li>Откройте DevTools → Network</li>
          <li>Нажмите "Принять" — увидите загрузку <code>tag.js</code></li>
          <li>Проверьте Console — увидите сообщение об успешной загрузке</li>
          <li>Нажмите кнопки тестирования — события отправятся в Метрику</li>
        </ol>
        <p style="margin-top: 10px; font-size: 0.9em; color: #7f8c8d;">
          <strong>Примечание:</strong> При "Отклонить" Метрика не загружается, события не отправляются.
        </p>
      </div>
    </div>
  `,
})
export class ConsentDemoComponent {
  private readonly metrikaInit = inject(YMInitService);
  private readonly metrika = inject(YMService);

  consentGiven = false;

  acceptConsent(): void {
    this.consentGiven = true;
    console.log('[ConsentDemo] Пользователь принял согласие, инициализируем Метрику...');
    this.metrikaInit.initializeAll();
  }

  rejectConsent(): void {
    this.consentGiven = false;
    console.log('[ConsentDemo] Пользователь отклонил согласие, Метрика не загружается');
  }

  trackGoal(): void {
    console.log('[ConsentDemo] Отправка цели "test_goal"');
    this.metrika.reachGoal('test_goal');
  }

  trackPageView(): void {
    console.log('[ConsentDemo] Отправка просмотра "/demo/consent"');
    this.metrika.hit('/demo/consent', { title: 'Consent Demo Page' });
  }
}

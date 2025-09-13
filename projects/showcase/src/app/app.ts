import { Component, signal } from '@angular/core';
import {
  YMGoalDirective,
  YMHitDirective,
  YMMethodDirective,
  YMNotBounceDirective,
  YMParamsDirective,
} from '../../../yandex-metrika/src/lib/ym-directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    YMMethodDirective,
    YMGoalDirective,
    YMHitDirective,
    YMParamsDirective,
    YMNotBounceDirective,
  ],
})
export class App {
  protected readonly isPremiumUser = signal(true);
}

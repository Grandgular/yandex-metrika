import {
  Directive,
  input,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { YMService } from './ym-service';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[ymMethod]',
  standalone: true,
})
export class YMMethodDirective implements OnInit, OnDestroy {
  readonly #ymService = inject(YMService);
  readonly #elementRef = inject(ElementRef);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly method = input.required<string>({ alias: 'ymMethod' });
  readonly counterId = input<number | string | null>(null, { alias: 'ymCounterId' });
  readonly event = input<string>('click', { alias: 'ymEvent' });
  readonly params = input<Record<string, any> | string | null>(null, { alias: 'ymParams' });
  readonly condition = input<boolean>(true, { alias: 'ymCondition' });

  private eventListener: (() => void) | null = null;

  public ngOnInit(): void {
    if (this.#isBrowser) this.setupEventListener();
  }

  public ngOnDestroy(): void {
    if (this.#isBrowser) this.removeEventListener();
  }

  private setupEventListener(): void {
    const element = this.#elementRef.nativeElement;
    const eventName = this.event();

    this.eventListener = () => this.handleEvent();
    element.addEventListener(eventName, this.eventListener);
  }

  private removeEventListener(): void {
    if (!this.eventListener) return;

    this.#elementRef.nativeElement.removeEventListener(this.event(), this.eventListener);
    this.eventListener = null;
  }

  private handleEvent(): void {
    if (!this.condition()) return;

    const methodParams = this.getMethodParams();

    this.counterId()
      ? this.#ymService.ym(this.counterId(), this.method(), ...methodParams)
      : this.#ymService.ym(this.method(), ...methodParams);
  }

  protected getMethodParams(): any[] {
    return [this.params()];
  }
}

@Directive({
  selector: '[ymGoal]',
  standalone: true,
})
export class YMGoalDirective extends YMMethodDirective {
  override method = input<string>('reachGoal', { alias: 'ymMethod' });

  goalName = input.required<string>({ alias: 'ymGoal' });

  protected override getMethodParams(): any[] {
    return [this.goalName(), this.params()];
  }
}

@Directive({
  selector: '[ymHit]',
  standalone: true,
})
export class YMHitDirective extends YMMethodDirective {
  override method = input<string>('hit', { alias: 'ymMethod' });

  url = input.required<string>({ alias: 'ymHit' });

  protected override getMethodParams(): any[] {
    return [this.url(), this.params()];
  }
}

@Directive({
  selector: '[ymParams]',
  standalone: true,
})
export class YMParamsDirective extends YMMethodDirective {
  override method = input<string>('params', { alias: 'ymMethod' });

  protected override getMethodParams(): any[] {
    return [this.params()];
  }
}

@Directive({
  selector: '[ymNotBounce]',
  standalone: true,
})
export class YMNotBounceDirective extends YMMethodDirective {
  override method = input<string>('notBounce', { alias: 'ymMethod' });

  protected override getMethodParams(): any[] {
    return [];
  }
}

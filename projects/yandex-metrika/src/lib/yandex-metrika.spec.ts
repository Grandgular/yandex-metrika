import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YandexMetrika } from './yandex-metrika';

describe('YandexMetrika', () => {
  let component: YandexMetrika;
  let fixture: ComponentFixture<YandexMetrika>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YandexMetrika]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YandexMetrika);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

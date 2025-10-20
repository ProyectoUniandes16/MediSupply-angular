import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { FakeTranslateLoader } from './testing/i18n-testing.helper';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        TranslateService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'MedySupply' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MedySupply');
  });

  it('should configure available languages', () => {
    const translateService = TestBed.inject(TranslateService);
    const spy = spyOn(translateService, 'addLangs');
    
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    expect(spy).toHaveBeenCalledWith(['es', 'en']);
  });

  it('should set Spanish as default language', () => {
    const translateService = TestBed.inject(TranslateService);
    const spy = spyOn(translateService, 'setDefaultLang');
    
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    expect(spy).toHaveBeenCalledWith('es');
  });

  it('should use stored language from localStorage on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const translateService = TestBed.inject(TranslateService);
    const app = fixture.componentInstance;
    
    spyOn(localStorage, 'getItem').and.returnValue('en');
    const useSpy = spyOn(translateService, 'use');
    
    app.ngOnInit();
    
    expect(useSpy).toHaveBeenCalledWith('en');
  });

  it('should use Spanish when no language is stored in localStorage', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const translateService = TestBed.inject(TranslateService);
    const app = fixture.componentInstance;
    
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const useSpy = spyOn(translateService, 'use');
    
    app.ngOnInit();
    
    expect(useSpy).toHaveBeenCalledWith('es');
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

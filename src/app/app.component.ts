import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'MedySupply';

  constructor(private readonly translate: TranslateService) {
    // Configurar idiomas disponibles
    this.translate.addLangs(['es', 'en']);
    
    // Establecer español como idioma por defecto
    this.translate.setDefaultLang('es');
  }

  ngOnInit(): void {
    // Obtener el idioma almacenado o usar español por defecto
    const browserLang = localStorage.getItem('language') || 'es';
    this.translate.use(browserLang);
  }
}

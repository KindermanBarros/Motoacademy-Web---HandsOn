import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter "Serviços" como item ativo por padrão', () => {
    expect(component.selectedItem).toBe('Serviços');
  });

  it('deve atualizar o item ativo ao clicar', () => {
    component.selectItem('Dashboard');
    expect(component.selectedItem).toBe('Dashboard');

    component.selectItem('Clientes');
    expect(component.selectedItem).toBe('Clientes');
  });

  it('deve aplicar a classe "active" ao item selecionado', () => {
    component.selectItem('Usuários');
    fixture.detectChanges();

    const activeLink = fixture.debugElement.query(By.css('.nav-link.active'));
    expect(activeLink.nativeElement.textContent).toContain('Usuários');
  });
});
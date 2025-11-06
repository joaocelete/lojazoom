import { Shield, Lock, CreditCard, Truck } from "lucide-react";
import sslBadge from "@assets/generated_images/SSL_security_badge_1195482c.png";
import paymentBadge from "@assets/generated_images/Secure_payment_badge_421b2494.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-about">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-privacy">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-terms">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-delivery">Política de Entrega</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-contact">Fale Conosco</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-faq">Perguntas Frequentes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-track-order">Rastrear Pedido</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="link-returns">Trocas e Devoluções</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Formas de Pagamento</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Cartão de Crédito</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Pix</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-primary" />
                <span>Boleto Bancário</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Pagamentos processados via Mercado Pago
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">Selos de Segurança</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={sslBadge} alt="SSL Seguro" className="h-12 w-12 object-contain" />
                <div className="text-xs">
                  <div className="font-semibold">Site Seguro</div>
                  <div className="text-muted-foreground">SSL Certificado</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={paymentBadge} alt="Pagamento Seguro" className="h-12 w-12 object-contain" />
                <div className="text-xs">
                  <div className="font-semibold">Compra Protegida</div>
                  <div className="text-muted-foreground">Dados Criptografados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-primary/10 p-2 rounded-md">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">Compra Segura</div>
                <div className="text-xs text-muted-foreground">100% Protegida</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="bg-primary/10 p-2 rounded-md">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">Entrega Garantida</div>
                <div className="text-xs text-muted-foreground">Todo o Brasil</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-end">
              <div className="bg-primary/10 p-2 rounded-md">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">Suporte 24/7</div>
                <div className="text-xs text-muted-foreground">Sempre disponível</div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p data-testid="text-copyright">
              © 2025 PrintBrasil - Comunicação Visual. Todos os direitos reservados.
            </p>
            <p className="mt-1 text-xs">
              CNPJ: 00.000.000/0001-00 | Endereço: Rua Exemplo, 123 - São Paulo, SP
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2 } from 'lucide-react';

interface PaymentGatewaySelectorProps {
  selectedGateway: 'stripe' | 'paypal';
  onGatewayChange: (gateway: 'stripe' | 'paypal') => void;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
}

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  selectedGateway,
  onGatewayChange,
  stripeEnabled,
  paypalEnabled,
}) => {
  const hasMultipleOptions = stripeEnabled && paypalEnabled;

  if (!hasMultipleOptions) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedGateway}
          onValueChange={onGatewayChange}
          className="grid grid-cols-2 gap-4"
        >
          {stripeEnabled && (
            <div>
              <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
              <Label
                htmlFor="stripe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <CreditCard className="mb-3 h-6 w-6" />
                <span className="font-semibold">Cartão de Crédito</span>
                <span className="text-sm text-muted-foreground">Processado por Stripe</span>
              </Label>
            </div>
          )}

          {paypalEnabled && (
            <div>
              <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Building2 className="mb-3 h-6 w-6" />
                <span className="font-semibold">PayPal</span>
                <span className="text-sm text-muted-foreground">Pagamento rápido</span>
              </Label>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentGatewaySelector;

import { AdminLayout } from "@/components/admin/AdminLayout";
import { TypographySection } from "@/components/design-system/TypographySection";
import { ButtonSection } from "@/components/design-system/ButtonSection";
import { FormElementsSection } from "@/components/design-system/FormElementsSection";
import { DisplayElementsSection } from "@/components/design-system/DisplayElementsSection";
import { FeedbackElementsSection } from "@/components/design-system/FeedbackElementsSection";
import { Separator } from "@/components/ui/separator";

const DesignSystem = () => {
  return (
    <AdminLayout>
      <div className="space-y-10 p-6">
        <h1 className="text-4xl font-bold text-admin-foreground">Sistema de Design</h1>
        <p className="text-admin-foreground-muted">
          Uma visão geral de todos os componentes e estilos disponíveis na aplicação.
        </p>

        <Separator className="bg-admin-border" />

        <TypographySection />

        <Separator className="bg-admin-border" />

        <ButtonSection />

        <Separator className="bg-admin-border" />

        <FormElementsSection />

        <Separator className="bg-admin-border" />

        <DisplayElementsSection />

        <Separator className="bg-admin-border" />

        <FeedbackElementsSection />
      </div>
    </AdminLayout>
  );
};

export default DesignSystem;
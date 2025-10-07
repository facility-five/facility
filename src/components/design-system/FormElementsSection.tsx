import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export const FormElementsSection = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [switchChecked, setSwitchChecked] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Elementos de Formulário</h2>
      <Separator className="bg-admin-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="input-text">Input de Texto</Label>
          <Input
            id="input-text"
            placeholder="Digite algo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-admin-background border-admin-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea">Textarea</Label>
          <Textarea
            id="textarea"
            placeholder="Digite um texto longo..."
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            className="bg-admin-background border-admin-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="select">Select</Label>
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger id="select" className="bg-admin-background border-admin-border">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
              <SelectItem value="opcao1">Opção 1</SelectItem>
              <SelectItem value="opcao2">Opção 2</SelectItem>
              <SelectItem value="opcao3">Opção 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkbox"
            checked={checkboxChecked}
            onCheckedChange={(checked) => setCheckboxChecked(!!checked)}
          />
          <Label htmlFor="checkbox">Aceito os termos e condições</Label>
        </div>

        <div className="space-y-2">
          <Label>Radio Group</Label>
          <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="radio1" id="radio1" />
              <Label htmlFor="radio1">Opção A</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="radio2" id="radio2" />
              <Label htmlFor="radio2">Opção B</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="switch"
            checked={switchChecked}
            onCheckedChange={setSwitchChecked}
          />
          <Label htmlFor="switch">Ativar notificações</Label>
        </div>
      </div>
    </div>
  );
};
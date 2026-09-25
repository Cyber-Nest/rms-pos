export interface ModifierOption {
  id: string;
  name: string;
  image?: string;
  price: number;
  isDefault?: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  displayType: 'radio' | 'checkbox' | 'card' | 'counter';
  options: ModifierOption[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
  quantity?: number;
  isRoot?: boolean;
  parentOptionId?: string;
  parentOptionName?: string;
}


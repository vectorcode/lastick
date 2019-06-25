export interface IProductTicket extends IProductItem {
  place_uuid: string;
  meta: any;
  is_for_sale: boolean;
  is_for_booking: boolean;
  is_in_cart?: boolean;
}

export interface ICartData {
  items: ICartItem[];
  total_cost: number;
  total_items: number;
  certificate: ICertificate;
  payment_method: IPaymentMethod;
  service_fee: number;
}

export interface IServerCartItem {
  cart_uuid: string;
  uuid: string;
  ProductItem: {
    uuid: string
  };
  product_item?: any;
  error: any;
  meta: any;
  quantity: number;
  price: number;
  PriceValue: {
    uuid: string;
    is_base_price: boolean;
    amount: number;
  };
  AppliedPromos: [
    {
      uuid: string;
      name: IMultilangString;
    }
    ];

  PriceModifiers: IPriceModifier[];
  total_cost: number;
  expired_at: string;
  is_expired: boolean;
  is_reserved: boolean;
  expiration_countdown?: number;
}

export interface ICartItem {
  uuid?: string;
  ProductItem?: any;
  PriceValue: {
    uuid: string;
    is_base_price: boolean;
    amount: number;
  };
  PriceModifiers: IPriceModifier[];
  total_cost: number;
  service_fee: number;
  quantity: number;
}

export interface IPromo {
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  is_active: boolean;
  is_deleted: boolean;
  name: IMultilangString;
  validity_range: string;
  rules: any;
  meta: any;
  promo_type: string;
  price_modifier_uuid: string;
  allow_overpayment: boolean;
}

export interface IPromocode {
  uuid: string;
  code: string;
  Promo: IPromo;
  promo_uuid: string;
}

export interface IProductItem {
  uuid: string;
  product_item_type: string;
  quantity: number;
  price_values: string[];
}

export interface ICertificate {
  view: {
    name: IMultilangString;
    _uuid: string;
    media: {
      name: string;
      path: string;
      size: number;
      type: string;
      uploaded_at: number
    };
    is_active: boolean;
    description: IMultilangString;
  };
  config: {
    name: IMultilangString;
    _uuid: string;
    is_active: boolean;
    description: IMultilangString;
  };
}

export interface IPriceModifier {
  uuid: string;
  operation: any;
  value_type: any;
  value: string;
  formatted_value: string;
}

export interface IMultilangString {
  [lang_code: string]: any;
}

export interface IPaymentMethod {
  uuid: string;
}

export interface IPriceValue {
  uuid: string;
  is_base_price: boolean;
  amount: number;
  PriceCategory?: IPriceCategory;
}

export interface IPriceCategory {
  uuid: string;
  name: IMultilangString;
  description: IMultilangString;
  is_base_category?: boolean;
}

export interface IContacts {
  contacts: {
    email: string,
    phone: string
  };
}

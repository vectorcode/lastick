export interface ICart {
    Certificate: {
        uuid: string;
        is_active: boolean;
        is_deleted: boolean;
        name: {
            en: string;
            ru: string;
            etc: string;
        };
        validity_range: {
            start: {
                type: any;
            };
            end: {
                type: any;
            }
        };
        rules: any;
        meta: any
    };
    Promocodes: [
        {
            uuid: string;
            code: string;
            Promo: {
                uuid: string;
                name: {
                    en: string;
                    ru: string;
                    etc: string
                }
            }
        }
        ];
    CartItems: [
        {
            uuid: string;
            ProductItem: {
                uuid: string
            };
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
                    name: {
                        en: string;
                        ru: string;
                        etc: string
                    }
                }
                ];
            PriceModifiers: [
                {
                    uuid: string;
                    operation: any;
                    value_type: any;
                    value: string;
                    formatted_value: string;
                }
                ];
            total_cost: number;
            expired_at: string;
            is_expired: boolean;
            is_reserved: boolean;
        }
    ];
    items: any;
    total_cost: number;
}
export interface ISertificate {
    uuid: string,
    created_at: string,
    updated_at: string,
    deleted_at: any,
    is_active: boolean,
    is_deleted: boolean,
    name:
        {
            en: string,
            ru: string
        },
    validity_range: string,
    rules: any,
    meta: {
        view: {
            name: {
                en: string,
                ru: string
            },
            _uuid: string,
            media: {
                name: string,
                path: string,
                size: number,
                type: string,
                uploaded_at: number
            },
            is_active: boolean,
            description: {
                en: string,
                ru: string
            }
        },
        config: {
            name: {
                en: string,
                ru: string
            },
            _uuid: string,
            is_active: boolean,
            description: {
                en: string,
                ru: string
            }
        }
    },
    promo_type: string,
    price_modifier_uuid: string,
    allow_overpayment: boolean,
    PriceModifier: {
        uuid: string,
        created_at: string,
        updated_at: string,
        deleted_at: boolean,
        is_active: boolean,
        is_deleted: boolean,
        name: string,
        formatted_value: string,
        value: string,
        value_type: string,
        operation: string
    }
}
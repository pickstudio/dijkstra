interface KakaoAccount {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
        nickname: string;
        thumbnail_image_url: string;
        profile_image_url: string;
        is_default_image: boolean;
    };
    has_age_range: boolean;
    age_range_needs_agreement: boolean;
    has_birthday: boolean;
    birthday_needs_agreement: boolean;
    has_gender: boolean;
    gender_needs_agreement: boolean;
}

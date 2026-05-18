$path = "c:\Users\im a god bruh\Documents\GitHub\azure-clean-sparkle\src\i18n\locales\en\translation.json"
$json = Get-Content -Raw -Path $path | ConvertFrom-Json

$promocoes = @{
    title = "Special Promotions"
    subtitle = "Earn discounts and rewards by sharing your experience with us"
    instagram = @{
        title = "€5 Discount"
        badge = "Instagram Stories Review"
        step1 = "Make a video review of the service on your Instagram Stories"
        step2 = "Tag our page"
        step2Account = "@cleansolutions.pt"
        step2End = "in the video"
        step3 = "Click the button below to notify us via WhatsApp"
        step4 = "Receive €5 discount immediately after validation"
        button = "Notify via WhatsApp"
    }
    affiliate = @{
        title = "Earn up to €100 for every validated recommendation"
        badge = "Clean Solutions Rewards"
        step1 = "Refer friends, family or acquaintances"
        step2 = "The recommended person receives"
        step2Discount = "10% discount"
        step2End = "on their first service"
        step3 = "Receive your reward automatically after validation"
        step4 = "No referral limits!"
        disclaimer = "Reward: between €10 and €100, depending on the service value. Eligibility: services between €150 and €1500. Payment: sent after recommendation validation."
        placeholder = "Phone or @Instagram of the referred person"
        button = "Refer via WhatsApp"
        alertMessage = "Please enter the phone number or Instagram account of the person you referred"
        emotional = "Because a satisfied customer deserves to be rewarded."
    }
    tiers = @{
        title = "Clean Solutions Rewards Tiers"
        level1 = @{
            name = "Clean Partner"
            reward = "€10 per recommendation"
            perk = "10% discount for the recommended person"
        }
        level2 = @{
            name = "Clean Elite"
            requirement = "After 5 referrals"
            reward = "€20 per recommendation"
            perk1 = "Free cushion cleaning 1x/year"
            perk2 = "Priority support"
        }
        level3 = @{
            name = "Clean VIP"
            requirement = "After 10 referrals"
            reward = "€30–€50 per recommendation"
            perk1 = "Lifetime 10% discount"
            perk2 = "Free small item waterproofing 1x/year"
            perk3 = "Priority service"
        }
        level4 = @{
            name = "Clean Ambassador"
            requirement = "After 25 referrals"
            reward = "Up to €100 per recommendation"
            perk1 = "Free annual cleaning session"
            perk2 = "Dedicated line"
            perk3 = "Event invitations"
            perk4 = "Early access to campaigns"
        }
    }
    howItWorks = @{
        title = "How Does It Work?"
        text1 = "Choose your preferred promotion and click the corresponding button. You will be redirected to WhatsApp where you can send us the necessary information."
        text2 = "Promotions are not cumulative and are subject to confirmation. The discount/payment is processed after validation."
    }
}

$json.promocoes = $promocoes
$json | ConvertTo-Json -Depth 100 | Set-Content $path -Encoding UTF8

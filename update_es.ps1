$path = "c:\Users\im a god bruh\Documents\GitHub\azure-clean-sparkle\src\i18n\locales\es\translation.json"
$json = Get-Content -Raw -Path $path | ConvertFrom-Json

$promocoes = @{
    title = "Promociones Especiales"
    subtitle = "Gane descuentos y recompensas por compartir su experiencia con nosotros"
    instagram = @{
        title = "Descuento 5€"
        badge = "Instagram Stories Review"
        step1 = "Haga un video review del servicio en sus Instagram Stories"
        step2 = "Identifique nuestra página"
        step2Account = "@cleansolutions.pt"
        step2End = "en el video"
        step3 = "Haga clic en el botón abajo para avisarnos vía WhatsApp"
        step4 = "Reciba 5€ de descuento inmediatamente después de validación"
        button = "Avisar vía WhatsApp"
    }
    affiliate = @{
        title = "Gane hasta 100€ por cada recomendación validada"
        badge = "Clean Solutions Rewards"
        step1 = "Indique amigos, familiares o conocidos"
        step2 = "La persona recomendada recibe"
        step2Discount = "10% de descuento"
        step2End = "en su primer servicio"
        step3 = "Reciba su recompensa automáticamente tras la validación"
        step4 = "¡Sin límite de recomendaciones!"
        disclaimer = "Recompensa: entre 10€ y 100€, según el valor del servicio. Elegibilidad: servicios entre 150€ y 1500€. Pago: enviado tras validación de la recomendación."
        placeholder = "Teléfono o @Instagram de la persona indicada"
        button = "Indicar vía WhatsApp"
        alertMessage = "Por favor, introduzca el número de teléfono o cuenta Instagram de la persona que indicó"
        emotional = "Porque un cliente satisfecho merece ser recompensado."
    }
    tiers = @{
        title = "Clean Solutions Rewards Tiers"
        level1 = @{
            name = "Clean Partner"
            reward = "10€ por recomendación"
            perk = "10% de descuento para el recomendado"
        }
        level2 = @{
            name = "Clean Elite"
            requirement = "Tras 5 indicaciones"
            reward = "20€ por recomendación"
            perk1 = "Limpieza gratuita de cojín 1x/año"
            perk2 = "Soporte con prioridad"
        }
        level3 = @{
            name = "Clean VIP"
            requirement = "Tras 10 indicaciones"
            reward = "30€–50€ por recomendación"
            perk1 = "10% de descuento vitalicio"
            perk2 = "Impermeabilización pequeña gratuita 1x/año"
            perk3 = "Atención prioritaria"
        }
        level4 = @{
            name = "Clean Ambassador"
            requirement = "Tras 25 indicaciones"
            reward = "Hasta 100€ por recomendación"
            perk1 = "Sesión de limpieza anual gratuita"
            perk2 = "Línea dedicada"
            perk3 = "Invitaciones para eventos"
            perk4 = "Acceso anticipado a campañas"
        }
    }
    howItWorks = @{
        title = "¿Cómo Funciona?"
        text1 = "Elija la promoción que prefiera y haga clic en el botón correspondiente. Será redirigido a WhatsApp donde puede enviarnos la información necesaria."
        text2 = "Las promociones no son acumulables y están sujetas a confirmación. El descuento/pago se procesa tras validación."
    }
}

$json.promocoes = $promocoes
$json | ConvertTo-Json -Depth 100 | Set-Content $path -Encoding UTF8

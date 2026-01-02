# 📧 TEMPLATE EMAIL FRANÇAIS - SUPABASE

**Pour** : Supabase → Auth → Email Templates → **Reset Password**

---

## 🔗 **LIEN SUPABASE**

```
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/auth/templates
```

---

## 📝 **TEMPLATE À COPIER-COLLER**

### **Subject (Sujet)**

```
Réinitialisation de votre mot de passe - AnnonceAuto.ci
```

---

### **Body (Corps HTML)**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="background: linear-gradient(135deg, #FACC15 0%, #FBBF24 100%); width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <div style="color: #0F172A; font-size: 40px; font-weight: bold;">🔐</div>
    </div>
    <h1 style="color: #0F172A; font-size: 28px; margin: 0 0 10px 0;">Réinitialisation de mot de passe</h1>
    <p style="color: #6B7280; font-size: 16px; margin: 0;">AnnonceAuto.ci</p>
  </div>

  <!-- Content -->
  <div style="background: #F3F4F6; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
    <p style="color: #0F172A; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Bonjour,
    </p>
    
    <p style="color: #0F172A; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Vous avez demandé à réinitialiser votre mot de passe sur <strong>AnnonceAuto.ci</strong>.
    </p>
    
    <p style="color: #0F172A; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(135deg, #FACC15 0%, #FBBF24 100%); color: #0F172A; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3);">
        Réinitialiser mon mot de passe
      </a>
    </div>
    
    <!-- Link alternative -->
    <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
      <a href="{{ .ConfirmationURL }}" style="color: #FACC15; word-break: break-all;">{{ .ConfirmationURL }}</a>
    </p>
  </div>

  <!-- Warning -->
  <div style="background: #FEF3C7; border-left: 4px solid #FACC15; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
    <p style="color: #92400E; font-size: 14px; line-height: 1.6; margin: 0;">
      <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.
    </p>
  </div>

  <!-- Expiration -->
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #6B7280; font-size: 13px; margin: 0;">
      ⏱️ Ce lien expire dans <strong>1 heure</strong> pour des raisons de sécurité.
    </p>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
    <p style="color: #9CA3AF; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
      Cet email a été envoyé par <strong>AnnonceAuto.ci</strong><br>
      La plateforme de vente automobile en Côte d'Ivoire
    </p>
    
    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
      © 2024 AnnonceAuto.ci - Tous droits réservés
    </p>
  </div>
</div>
```

---

## 🎯 **INSTRUCTIONS**

### **1. Aller dans Email Templates**

```
https://supabase.com/dashboard/project/vnhwllsawfaueivykhly/auth/templates
```

### **2. Cliquer sur "Reset Password"**

### **3. Copier-coller**

- **Subject** : Copie le sujet ci-dessus
- **Body** : Copie tout le code HTML ci-dessus

### **4. Save**

Clique **"Save"** en bas

---

## ✅ **RÉSULTAT**

Après ça, l'email sera **100% en français** avec :
- ✅ Design moderne aux couleurs AnnonceAuto (jaune #FACC15)
- ✅ Bouton CTA stylé
- ✅ Lien alternatif si bouton ne marche pas
- ✅ Warning de sécurité
- ✅ Indication d'expiration (1h)
- ✅ Footer professionnel

---

**Configure ça maintenant ! 🚀**







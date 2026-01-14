# 🔧 FIX RAPIDE : Supabase commande introuvable

## Problème
Le nouveau PowerShell ne reconnaît pas `supabase` car le PATH de Scoop n'est pas encore chargé.

---

## ✅ Solution 1 : FERME ET ROUVRE PowerShell (RECOMMANDÉ)

1. **Ferme** complètement le PowerShell actuel
2. **Rouvre** un nouveau PowerShell
3. Tape :

```powershell
cd C:\Users\nande\Desktop\annonce-auto-ci
supabase --version
```

Si ça affiche `2.67.1` → ✅ **c'est bon !**

---

## ✅ Solution 2 : Recharger le PATH (dans le PowerShell actuel)

Si tu veux pas fermer/rouvrir, tape ça dans le PowerShell actuel :

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Puis vérifie :

```powershell
supabase --version
```

---

## ✅ Solution 3 : Utiliser le chemin complet (dernier recours)

Si rien ne marche, utilise le chemin complet :

```powershell
C:\Users\nande\scoop\shims\supabase.exe --version
```

Si ça marche, remplace `supabase` par `C:\Users\nande\scoop\shims\supabase.exe` dans toutes les commandes.

---

## 🚀 Après que ça marche

Une fois que `supabase --version` fonctionne, lance :

```powershell
cd C:\Users\nande\Desktop\annonce-auto-ci
supabase login
```

Puis les 3 déploiements :

```powershell
supabase functions deploy payfonte-create-checkout --project-ref vnhwllsawfaueivykhly
supabase functions deploy payfonte-verify-payment --project-ref vnhwllsawfaueivykhly
supabase functions deploy payfonte-webhook --project-ref vnhwllsawfaueivykhly
```

---

**📢 Essaye Solution 1 (fermer/rouvrir PowerShell) en premier, c'est le plus simple !**









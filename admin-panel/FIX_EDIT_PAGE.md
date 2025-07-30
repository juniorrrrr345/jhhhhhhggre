# Guide pour corriger la page d'édition

## Problème actuel
La page d'édition (`/admin/plugs/[id]/edit.js`) utilise encore l'ancienne structure avec `departments` au lieu de `cities`.

## Solution temporaire

### Option 1 : Utiliser la page de création
Au lieu de modifier une boutique existante, vous pouvez :
1. Noter les informations de la boutique
2. La supprimer
3. La recréer avec la page "Nouvelle boutique" qui fonctionne correctement

### Option 2 : Modification directe dans la base de données
Utilisez le script suivant pour mettre à jour directement :

```javascript
// Script pour mettre à jour une boutique
const updatePlug = async (plugId, cities) => {
  const response = await fetch('/api/plugs/' + plugId, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer JuniorAdmon123',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      services: {
        delivery: { cities: cities.delivery },
        meetup: { cities: cities.meetup }
      }
    })
  });
  return response.json();
};
```

## Solution permanente (à implémenter)

Pour corriger définitivement, il faut :

1. **Mettre à jour l'UI** : Remplacer tous les `departments` par `cities` dans le formulaire
2. **Mettre à jour les handlers** : Utiliser `toggleCity` au lieu de `toggleDepartment`
3. **Mettre à jour l'affichage** : Afficher "villes" au lieu de "départements"

## Workaround actuel

Le système convertit automatiquement :
- Les villes sélectionnées → codes postaux
- Les codes postaux sont stockés dans `postalCodes` ET `departments`
- La mini app peut utiliser l'un ou l'autre

Donc même si l'interface affiche "départements", en sélectionnant des codes postaux, ils seront convertis correctement.
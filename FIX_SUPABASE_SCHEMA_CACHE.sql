-- Script pour rafraîchir le cache du schéma Supabase
-- Ceci force Supabase à recharger les métadonnées de la table credits_transactions

-- Réappliquer un COMMENT sur la table pour forcer le refresh
COMMENT ON TABLE credits_transactions IS 'Historique des transactions de crédits (balance_after column fixed)';

-- Réappliquer un COMMENT sur la colonne balance_after
COMMENT ON COLUMN credits_transactions.balance_after IS 'Solde après la transaction';

-- Notifier PostgREST de recharger le cache
NOTIFY pgrst, 'reload schema';






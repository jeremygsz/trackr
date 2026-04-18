-- Insertion de l'admin (password: admin123)
-- On utilise un ID fixe pour simplifier les relations dans le seed
INSERT INTO "User" (id, firstname, lastname, email, password, role, currency, "createdAt", "updatedAt")
VALUES ('admin-id-123', 'Admin', 'Trackr', 'admin@trackr.fr', '$2a$12$R9h/lIPzHZ7.3m66p.jRP.yHTrp6W9.yHTrp6W9.yHTrp6W9.yHTrp', 'admin', 'EUR', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insertion des codes d'invitation
INSERT INTO "InviteCode" (id, code, "createdBy", "createdAt", "updatedAt")
VALUES 
  ('code-1', 'TRACKR-2026', 'admin-id-123', NOW(), NOW()),
  ('code-2', 'VIP-ACCESS', 'admin-id-123', NOW(), NOW()),
  ('code-3', 'BETA-TEST', 'admin-id-123', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

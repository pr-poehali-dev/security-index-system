-- Создание таблицы пользователей системы
CREATE TABLE IF NOT EXISTS system_users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    personnel_id VARCHAR(36),
    email VARCHAR(255) NOT NULL UNIQUE,
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_users_tenant ON system_users(tenant_id);
CREATE INDEX idx_system_users_personnel ON system_users(personnel_id);
CREATE INDEX idx_system_users_email ON system_users(email);
CREATE INDEX idx_system_users_login ON system_users(login);

-- Таблица доступа пользователей к организациям
CREATE TABLE IF NOT EXISTS user_organization_access (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_org_access_user ON user_organization_access(user_id);
CREATE INDEX idx_user_org_access_org ON user_organization_access(organization_id);

COMMENT ON TABLE system_users IS 'Пользователи системы с логинами и паролями';
COMMENT ON TABLE user_organization_access IS 'Доступ пользователей к организациям и связанным данным';
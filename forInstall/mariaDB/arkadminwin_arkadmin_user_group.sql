create table arkadmin_user_group
(
    id          int auto_increment
        primary key,
    name        text     null,
    editform    int      null,
    time        bigint   null,
    permissions longtext null,
    canadd      longtext null
);

INSERT INTO arkadmin_user_group (id, name, editform, time, permissions, canadd) VALUES (1, 'Superadmin', 1, 1603693072, '{"all":{"is_admin":1}}', '[1]');
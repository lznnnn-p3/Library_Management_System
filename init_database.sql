-- =============================================
-- 图书管理系统 数据库初始化脚本
-- Library Management System - Database Init Script
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS library_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE library_db;

-- =============================================
-- 1. 用户表 sys_user
-- =============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
    nickname VARCHAR(50) DEFAULT '' COMMENT '昵称',
    email VARCHAR(100) DEFAULT '' COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT '' COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态(1:正常 0:禁用)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 角色表 sys_role
-- =============================================
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_key VARCHAR(50) NOT NULL UNIQUE COMMENT '角色标识',
    status TINYINT DEFAULT 1 COMMENT '状态(1:正常 0:禁用)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- =============================================
-- 3. 菜单/权限表 sys_menu
-- =============================================
DROP TABLE IF EXISTS sys_menu;
CREATE TABLE sys_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '菜单ID',
    menu_name VARCHAR(50) NOT NULL COMMENT '菜单名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID(0为顶级)',
    path VARCHAR(200) DEFAULT '' COMMENT '路由路径',
    component VARCHAR(200) DEFAULT '' COMMENT '前端组件路径',
    perms VARCHAR(100) DEFAULT '' COMMENT '权限标识',
    menu_type CHAR(1) DEFAULT 'M' COMMENT '菜单类型(M:目录 C:菜单 F:按钮)',
    icon VARCHAR(100) DEFAULT '' COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态(1:正常 0:禁用)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单权限表';

-- =============================================
-- 4. 用户角色关联表 sys_user_role
-- =============================================
DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- =============================================
-- 5. 角色菜单关联表 sys_role_menu
-- =============================================
DROP TABLE IF EXISTS sys_role_menu;
CREATE TABLE sys_role_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- =============================================
-- 6. 图书信息表 book_info
-- =============================================
DROP TABLE IF EXISTS book_info;
CREATE TABLE book_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '图书ID',
    book_name VARCHAR(200) NOT NULL COMMENT '书名',
    author VARCHAR(100) DEFAULT '' COMMENT '作者',
    isbn VARCHAR(20) DEFAULT '' COMMENT 'ISBN号',
    publisher VARCHAR(100) DEFAULT '' COMMENT '出版社',
    publish_date DATE DEFAULT NULL COMMENT '出版日期',
    category VARCHAR(50) DEFAULT '' COMMENT '分类',
    price DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
    stock INT DEFAULT 0 COMMENT '库存数量',
    description TEXT COMMENT '简介',
    status TINYINT DEFAULT 1 COMMENT '状态(1:正常 0:下架)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图书信息表';

-- =============================================
-- 7. 借阅记录表 book_borrow
-- =============================================
DROP TABLE IF EXISTS book_borrow;
CREATE TABLE book_borrow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    book_id BIGINT NOT NULL COMMENT '图书ID',
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '借阅日期',
    due_date DATETIME NOT NULL COMMENT '应还日期',
    return_date DATETIME DEFAULT NULL COMMENT '实际归还日期',
    renew_count INT DEFAULT 0 COMMENT '续借次数',
    status TINYINT DEFAULT 1 COMMENT '状态(1:借阅中 2:已归还 3:已超时)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='借阅记录表';

-- =============================================
-- 8. 公告表 announcement
-- =============================================
DROP TABLE IF EXISTS announcement;
CREATE TABLE announcement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶(1:置顶 0:不置顶)',
    status TINYINT DEFAULT 1 COMMENT '状态(1:已发布 0:已下架)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- =============================================
-- 预置数据
-- =============================================

-- 插入用户 (密码: 123456, BCrypt加密)
INSERT INTO sys_user (username, password, nickname, email, phone, status) VALUES
('admin', '$2b$10$KaAd9m9UFgp1wHjnT.ySseZ79X8XxI5WvJouN/G2tAWJxQHn7fYa6', '管理员', 'admin@library.com', '13800000001', 1),
('user', '$2b$10$uNnCF23YktqtiCPdz8zQ9.qv0xZp3DAJ06ibnzKw.y7hlpXl9L9aO', '普通用户', 'user@library.com', '13800000002', 1);

-- 插入角色
INSERT INTO sys_role (role_name, role_key, status) VALUES
('管理员', 'admin', 1),
('普通用户', 'user', 1);

-- 插入菜单
-- 顶级菜单
INSERT INTO sys_menu (id, menu_name, parent_id, path, component, perms, menu_type, icon, sort_order, status) VALUES
(1, '首页', 0, '/dashboard', 'Dashboard', 'dashboard', 'C', 'DashboardOutlined', 1, 1),
(2, '系统管理', 0, '/system', '', 'system', 'M', 'SettingOutlined', 2, 1),
(3, '图书管理', 0, '/book', '', 'book', 'M', 'BookOutlined', 3, 1);

-- 系统管理子菜单
INSERT INTO sys_menu (id, menu_name, parent_id, path, component, perms, menu_type, icon, sort_order, status) VALUES
(21, '用户管理', 2, '/system/user', 'system/User', 'system:user', 'C', 'UserOutlined', 1, 1),
(22, '角色管理', 2, '/system/role', 'system/Role', 'system:role', 'C', 'TeamOutlined', 2, 1);

-- 图书管理子菜单
INSERT INTO sys_menu (id, menu_name, parent_id, path, component, perms, menu_type, icon, sort_order, status) VALUES
(31, '图书列表', 3, '/book/list', 'book/BookList', 'book:list', 'C', 'UnorderedListOutlined', 1, 1),
(32, '借阅管理', 3, '/book/borrow', 'book/BookBorrow', 'book:borrow', 'C', 'SwapOutlined', 2, 1),
(33, '借阅记录', 3, '/book/record', 'book/BookRecord', 'book:record', 'C', 'FileTextOutlined', 3, 1);

-- 用户角色关联 (admin->管理员, user->普通用户)
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2);

-- 角色菜单关联 (管理员拥有所有菜单)
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 21), (1, 22), (1, 31), (1, 32), (1, 33);

-- 角色菜单关联 (普通用户只有首页和图书管理)
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(2, 1), (2, 3), (2, 31), (2, 32), (2, 33);

-- 公告管理菜单
INSERT INTO sys_menu (id, menu_name, parent_id, path, component, perms, menu_type, icon, sort_order, status) VALUES
(4, '公告管理', 0, '/announcement', '', 'announcement', 'M', 'NotificationOutlined', 4, 1),
(41, '公告列表', 4, '/announcement/list', 'announcement/AnnouncementList', 'announcement:list', 'C', 'UnorderedListOutlined', 1, 1);

-- 管理员拥有公告管理菜单
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 4), (1, 41);

-- 插入示例公告
INSERT INTO announcement (title, content, is_top, status) VALUES
('图书馆端午节开放通知', '各位读者：端午节期间（6月8日-6月10日）图书馆正常开放，开放时间为 9:00-17:00。6月11日恢复正常作息时间。祝大家端午安康！', 1, 1),
('新书上架通知', '本月新增图书200余册，涵盖计算机科学、文学小说、历史哲学等多个类别，欢迎广大读者前来借阅。新书专区位于图书馆二楼东侧。', 1, 1),
('借阅规则调整公告', '为提高图书流通效率，自即日起单次借阅期限由30天调整为14天，续借次数不变。已借出图书按原规则执行，请各位读者合理安排阅读时间。', 0, 1),
('图书馆WiFi升级完成', '图书馆无线网络已完成升级改造，覆盖全馆所有区域。网络名称：Library-Free，无需密码直接连接。如有网络问题请联系一楼服务台。', 0, 1),
('年度图书推荐活动开始', '2026年度"你推荐，我采购"活动正式开始！读者可在一楼服务台填写推荐书单，被采纳的推荐者可获得精美书签一套。活动截止日期：2026年7月31日。', 0, 1),
('系统维护通知（已下架）', '图书馆管理系统将于本周六凌晨2:00-6:00进行例行维护，届时系统暂停服务。', 0, 0);

-- 插入示例图书
INSERT INTO book_info (book_name, author, isbn, publisher, publish_date, category, price, stock, description, status) VALUES
('活着', '余华', '9787506365437', '作家出版社', '2012-08-01', '文学小说', 29.00, 5, '以一种渗透的表现手法完成了一次对生命意义的哲学追问。', 1),
('三体', '刘慈欣', '9787536692930', '重庆出版社', '2008-01-01', '科幻小说', 23.00, 8, '地球往事三部曲之一，人类文明的星际史诗。', 1),
('百年孤独', '加西亚·马尔克斯', '9787544253994', '南海出版公司', '2011-06-01', '文学小说', 39.50, 3, '魔幻现实主义文学的代表作，再现拉丁美洲历史社会图景。', 1),
('红楼梦', '曹雪芹', '9787020002207', '人民文学出版社', '1996-12-01', '古典文学', 59.70, 4, '中国古典四大名著之一，中国封建社会的百科全书。', 1),
('数据结构与算法分析', '马克·艾伦·维斯', '9787111528302', '机械工业出版社', '2016-01-01', '计算机', 69.00, 6, '经典数据结构教材，深入浅出讲解算法设计与分析。', 1),
('Spring实战（第5版）', 'Craig Walls', '9787115546821', '人民邮电出版社', '2020-02-01', '计算机', 89.00, 3, '全面介绍Spring框架的核心概念和实际应用。', 1),
('小王子', '安托万·德·圣-埃克苏佩里', '9787020042494', '人民文学出版社', '2003-08-01', '童话', 22.00, 10, '以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程。', 1),
('人类简史', '尤瓦尔·赫拉利', '9787508647357', '中信出版社', '2014-11-01', '历史', 68.00, 5, '从认知革命、农业革命到科学革命，全面叙述人类发展史。', 1);

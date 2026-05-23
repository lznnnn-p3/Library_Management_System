package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.library.dto.*;
import com.library.entity.SysRole;
import com.library.entity.SysUser;
import com.library.entity.SysUserRole;
import com.library.mapper.SysRoleMapper;
import com.library.mapper.SysUserRoleMapper;
import com.library.service.AuthService;
import com.library.service.CacheService;
import com.library.service.SysMenuService;
import com.library.service.SysUserService;
import com.library.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String CACHE_PREFIX_MENUS = "user:menus:";
    private static final String CACHE_PREFIX_ROLES = "user:roles:";
    private static final long CACHE_TIMEOUT = 3600; // 1 hour

    @Autowired
    private SysUserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private SysMenuService menuService;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired
    private SysRoleMapper roleMapper;
    @Autowired
    private CacheService cacheService;

    @Override
    public LoginResponse login(LoginRequest request) {
        SysUser user = userService.getByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (user.getStatus() == 0) {
            throw new RuntimeException("用户已被禁用");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getId());

        // Try to get menus from cache
        String menuCacheKey = CACHE_PREFIX_MENUS + user.getId();
        List<MenuDTO> menus = cacheService.get(menuCacheKey, List.class);
        if (menus == null) {
            menus = menuService.getMenusByUserId(user.getId());
            cacheService.put(menuCacheKey, menus, CACHE_TIMEOUT);
        }

        // Try to get roles from cache
        String roleCacheKey = CACHE_PREFIX_ROLES + user.getId();
        List<String> roles = cacheService.get(roleCacheKey, List.class);
        if (roles == null) {
            roles = getUserRoles(user.getId());
            cacheService.put(roleCacheKey, roles, CACHE_TIMEOUT);
        }

        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .nickname(user.getNickname())
                .roles(roles)
                .menus(menus)
                .build();
    }

    private List<String> getUserRoles(Long userId) {
        List<SysUserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, userId));
        List<Long> roleIds = userRoles.stream().map(SysUserRole::getRoleId).collect(Collectors.toList());
        if (roleIds.isEmpty()) return Collections.emptyList();
        List<SysRole> roles = roleMapper.selectBatchIds(roleIds);
        return roles.stream().map(SysRole::getRoleKey).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // Check if username exists
        SysUser existing = userService.getByUsername(request.getUsername());
        if (existing != null) {
            throw new RuntimeException("用户名已存在");
        }

        // Create new user
        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus(1);
        userService.save(user);

        // Assign default "user" role (id=2)
        SysUserRole userRole = new SysUserRole();
        userRole.setUserId(user.getId());
        userRole.setRoleId(2L);
        userRoleMapper.insert(userRole);
    }
}

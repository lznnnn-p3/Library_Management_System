package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.RoleDTO;
import com.library.entity.SysRole;
import com.library.entity.SysRoleMenu;
import com.library.entity.SysUserRole;
import com.library.mapper.SysRoleMapper;
import com.library.mapper.SysRoleMenuMapper;
import com.library.mapper.SysUserRoleMapper;
import com.library.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {

    @Autowired
    private SysRoleMenuMapper roleMenuMapper;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public List<SysRole> listAll() {
        return list(new LambdaQueryWrapper<SysRole>().orderByAsc(SysRole::getId));
    }

    @Override
    @Transactional
    public boolean addRole(RoleDTO dto) {
        SysRole role = new SysRole();
        role.setRoleName(dto.getRoleName());
        role.setRoleKey(dto.getRoleKey());
        role.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        save(role);

        if (dto.getMenuIds() != null) {
            for (Long menuId : dto.getMenuIds()) {
                SysRoleMenu rm = new SysRoleMenu();
                rm.setRoleId(role.getId());
                rm.setMenuId(menuId);
                roleMenuMapper.insert(rm);
            }
        }
        return true;
    }

    @Override
    @Transactional
    public boolean updateRole(RoleDTO dto) {
        SysRole role = getById(dto.getId());
        if (role == null) throw new RuntimeException("角色不存在");
        role.setRoleName(dto.getRoleName());
        role.setRoleKey(dto.getRoleKey());
        if (dto.getStatus() != null) role.setStatus(dto.getStatus());
        updateById(role);

        if (dto.getMenuIds() != null) {
            roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, role.getId()));
            for (Long menuId : dto.getMenuIds()) {
                SysRoleMenu rm = new SysRoleMenu();
                rm.setRoleId(role.getId());
                rm.setMenuId(menuId);
                roleMenuMapper.insert(rm);
            }
            clearCacheForRole(role.getId());
        }
        return true;
    }

    @Override
    @Transactional
    public boolean deleteRole(Long id) {
        if (id == 1L) throw new RuntimeException("不能删除管理员角色");
        roleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, id));
        userRoleMapper.delete(new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getRoleId, id));
        return removeById(id);
    }

    private void clearCacheForRole(Long roleId) {
        try {
            if (redisTemplate != null) {
                List<SysUserRole> userRoles = userRoleMapper.selectList(
                        new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getRoleId, roleId));
                for (SysUserRole ur : userRoles) {
                    redisTemplate.delete("user:menus:" + ur.getUserId());
                }
            }
        } catch (RedisConnectionFailureException e) {
            // ignore
        }
    }
}

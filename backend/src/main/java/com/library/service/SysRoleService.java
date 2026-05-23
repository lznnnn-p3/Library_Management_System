package com.library.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.RoleDTO;
import com.library.entity.SysRole;
import java.util.List;

public interface SysRoleService extends IService<SysRole> {
    List<SysRole> listAll();
    boolean addRole(RoleDTO dto);
    boolean updateRole(RoleDTO dto);
    boolean deleteRole(Long id);
}

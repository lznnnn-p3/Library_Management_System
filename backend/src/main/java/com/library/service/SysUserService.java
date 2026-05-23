package com.library.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.UserDTO;
import com.library.entity.SysUser;

public interface SysUserService extends IService<SysUser> {
    SysUser getByUsername(String username);
    Page<SysUser> pageList(int pageNum, int pageSize, String username, String nickname, String email, String phone, Integer status);
    boolean addUser(UserDTO dto);
    boolean updateUser(UserDTO dto);
    boolean deleteUser(Long id);
    boolean resetPassword(Long id, String newPassword);
}

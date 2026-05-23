package com.library.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.dto.Result;
import com.library.dto.UserDTO;
import com.library.entity.SysUser;
import com.library.entity.SysUserRole;
import com.library.mapper.SysUserRoleMapper;
import com.library.service.CacheService;
import com.library.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/system/user")
public class SysUserController {

    @Autowired
    private SysUserService userService;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired
    private CacheService cacheService;

    @GetMapping("/list")
    public Result<Page<SysUser>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer status) {
        Page<SysUser> page = userService.pageList(pageNum, pageSize, username, nickname, email, phone, status);
        page.getRecords().forEach(u -> u.setPassword(null));
        return Result.success(page);
    }

    @GetMapping("/roles/{userId}")
    public Result<List<Long>> getUserRoles(@PathVariable Long userId) {
        List<SysUserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, userId));
        List<Long> roleIds = userRoles.stream().map(SysUserRole::getRoleId).collect(Collectors.toList());
        return Result.success(roleIds);
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody UserDTO dto) {
        userService.addUser(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@Valid @RequestBody UserDTO dto) {
        userService.updateUser(dto);
        // Clear cache for this user
        cacheService.evict("user:menus:" + dto.getId());
        cacheService.evict("user:roles:" + dto.getId());
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/resetPassword")
    public Result<Void> resetPassword(@RequestParam Long id, @RequestParam String newPassword) {
        userService.resetPassword(id, newPassword);
        return Result.success("重置成功", null);
    }

    @GetMapping("/profile")
    public Result<SysUser> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        SysUser user = userService.getById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    @PutMapping("/profile")
    public Result<Void> updateProfile(@RequestBody SysUser userProfile) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        SysUser user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        if (userProfile.getNickname() != null) user.setNickname(userProfile.getNickname());
        if (userProfile.getEmail() != null) user.setEmail(userProfile.getEmail());
        if (userProfile.getPhone() != null) user.setPhone(userProfile.getPhone());
        userService.updateById(user);
        return Result.success("更新成功", null);
    }
}

package com.library.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.library.dto.Result;
import com.library.dto.RoleDTO;
import com.library.entity.SysRole;
import com.library.entity.SysRoleMenu;
import com.library.mapper.SysRoleMenuMapper;
import com.library.service.SysRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/system/role")
public class SysRoleController {

    @Autowired
    private SysRoleService roleService;
    @Autowired
    private SysRoleMenuMapper roleMenuMapper;

    @GetMapping("/list")
    public Result<List<SysRole>> list() {
        return Result.success(roleService.listAll());
    }

    @GetMapping("/menus/{roleId}")
    public Result<List<Long>> getRoleMenus(@PathVariable Long roleId) {
        List<SysRoleMenu> roleMenus = roleMenuMapper.selectList(
                new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getRoleId, roleId));
        List<Long> menuIds = roleMenus.stream().map(SysRoleMenu::getMenuId).collect(Collectors.toList());
        return Result.success(menuIds);
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody RoleDTO dto) {
        roleService.addRole(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@Valid @RequestBody RoleDTO dto) {
        roleService.updateRole(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.deleteRole(id);
        return Result.success("删除成功", null);
    }
}

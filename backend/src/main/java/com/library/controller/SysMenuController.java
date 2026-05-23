package com.library.controller;

import com.library.dto.MenuDTO;
import com.library.dto.Result;
import com.library.entity.SysMenu;
import com.library.service.SysMenuService;
import com.library.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/system/menu")
public class SysMenuController {

    @Autowired
    private SysMenuService menuService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public Result<List<MenuDTO>> getMenus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        List<MenuDTO> menus = menuService.getMenusByUserId(userId);
        return Result.success(menus);
    }

    @GetMapping("/all")
    public Result<List<MenuDTO>> getAllMenus() {
        return Result.success(menuService.getAllMenus());
    }

    @PostMapping
    public Result<Void> addMenu(@RequestBody SysMenu menu) {
        menuService.addMenu(menu);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> updateMenu(@RequestBody SysMenu menu) {
        menuService.updateMenu(menu);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return Result.success("删除成功", null);
    }
}

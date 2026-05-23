package com.library.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.MenuDTO;
import com.library.entity.SysMenu;
import java.util.List;

public interface SysMenuService extends IService<SysMenu> {
    List<MenuDTO> getMenusByUserId(Long userId);
    List<MenuDTO> getAllMenus();
    boolean addMenu(SysMenu menu);
    boolean updateMenu(SysMenu menu);
    boolean deleteMenu(Long id);
}

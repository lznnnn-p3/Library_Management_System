package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.MenuDTO;
import com.library.entity.SysMenu;
import com.library.mapper.SysMenuMapper;
import com.library.service.SysMenuService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements SysMenuService {

    @Override
    public List<MenuDTO> getMenusByUserId(Long userId) {
        List<SysMenu> menus = baseMapper.selectMenusByUserId(userId);
        List<MenuDTO> dtoList = menus.stream().map(this::toDTO).collect(Collectors.toList());
        return buildMenuTree(dtoList, 0L);
    }

    @Override
    public List<MenuDTO> getAllMenus() {
        List<SysMenu> menus = list(new LambdaQueryWrapper<SysMenu>().orderByAsc(SysMenu::getSortOrder));
        List<MenuDTO> dtoList = menus.stream().map(this::toDTO).collect(Collectors.toList());
        return buildMenuTree(dtoList, 0L);
    }

    @Override
    public boolean addMenu(SysMenu menu) {
        return save(menu);
    }

    @Override
    public boolean updateMenu(SysMenu menu) {
        return updateById(menu);
    }

    @Override
    public boolean deleteMenu(Long id) {
        long count = count(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getParentId, id));
        if (count > 0) throw new RuntimeException("请先删除子菜单");
        return removeById(id);
    }

    private MenuDTO toDTO(SysMenu menu) {
        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getId());
        dto.setMenuName(menu.getMenuName());
        dto.setParentId(menu.getParentId());
        dto.setPath(menu.getPath());
        dto.setComponent(menu.getComponent());
        dto.setPerms(menu.getPerms());
        dto.setMenuType(menu.getMenuType());
        dto.setIcon(menu.getIcon());
        dto.setSortOrder(menu.getSortOrder());
        return dto;
    }

    private List<MenuDTO> buildMenuTree(List<MenuDTO> menus, Long parentId) {
        List<MenuDTO> tree = new ArrayList<>();
        for (MenuDTO menu : menus) {
            if (parentId.equals(menu.getParentId())) {
                menu.setChildren(buildMenuTree(menus, menu.getId()));
                tree.add(menu);
            }
        }
        return tree;
    }
}

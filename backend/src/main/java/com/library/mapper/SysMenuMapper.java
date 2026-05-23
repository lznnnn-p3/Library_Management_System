package com.library.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.library.entity.SysMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {

    @Select("SELECT DISTINCT m.* FROM sys_menu m WHERE m.id IN (" +
            "SELECT rm.menu_id FROM sys_role_menu rm INNER JOIN sys_user_role ur ON rm.role_id = ur.role_id WHERE ur.user_id = #{userId}" +
            " UNION " +
            "SELECT cm.parent_id FROM sys_menu cm INNER JOIN sys_role_menu rm ON cm.id = rm.menu_id INNER JOIN sys_user_role ur ON rm.role_id = ur.role_id WHERE ur.user_id = #{userId} AND cm.parent_id != 0" +
            ") AND m.status = 1 ORDER BY m.sort_order")
    List<SysMenu> selectMenusByUserId(Long userId);
}

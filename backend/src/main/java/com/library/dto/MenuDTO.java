package com.library.dto;

import lombok.Data;
import java.util.List;

@Data
public class MenuDTO {
    private Long id;
    private String menuName;
    private Long parentId;
    private String path;
    private String component;
    private String perms;
    private String menuType;
    private String icon;
    private Integer sortOrder;
    private List<MenuDTO> children;
}

package com.library.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class AnnouncementDTO {
    private Long id;
    @NotBlank(message = "标题不能为空")
    private String title;
    @NotBlank(message = "内容不能为空")
    private String content;
    private Integer isTop;
    private Integer status;
}

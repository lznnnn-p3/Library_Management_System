package com.library.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookDTO {
    private Long id;
    @NotBlank(message = "书名不能为空")
    private String bookName;
    private String author;
    private String isbn;
    private String publisher;
    private LocalDate publishDate;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Integer status;
}

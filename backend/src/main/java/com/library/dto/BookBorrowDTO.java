package com.library.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookBorrowDTO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookName;
    private String author;
    private String username;
    private String nickname;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private Integer renewCount;
    private Integer status;
}

package com.library.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.BookBorrowDTO;
import com.library.entity.BookBorrow;
import java.util.Map;

public interface BookBorrowService extends IService<BookBorrow> {

    Page<BookBorrowDTO> pageList(int pageNum, int pageSize, Long userId, Integer status, boolean isAdmin);

    void borrowBook(Long userId, Long bookId);

    void returnBook(Long borrowId, Long userId, boolean isAdmin);

    void renewBook(Long borrowId, Long userId, boolean isAdmin);

    void checkOverdue();

    Map<String, Object> getBorrowSummary(Long userId);
}

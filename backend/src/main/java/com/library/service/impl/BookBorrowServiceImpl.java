package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.BookBorrowDTO;
import com.library.entity.BookBorrow;
import com.library.entity.BookInfo;
import com.library.entity.SysUser;
import com.library.mapper.BookBorrowMapper;
import com.library.mapper.BookInfoMapper;
import com.library.mapper.SysUserMapper;
import com.library.service.BookBorrowService;
import com.library.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookBorrowServiceImpl extends ServiceImpl<BookBorrowMapper, BookBorrow> implements BookBorrowService {

    private static final int BORROW_DAYS = 7;
    private static final int MAX_RENEW_DAYS = 30;

    @Autowired
    private BookInfoMapper bookInfoMapper;
    @Autowired
    private SysUserMapper userMapper;
    @Autowired
    private SmsService smsService;

    @Override
    public Page<BookBorrowDTO> pageList(int pageNum, int pageSize, Long userId, Integer status, boolean isAdmin) {
        LambdaQueryWrapper<BookBorrow> wrapper = new LambdaQueryWrapper<>();
        if (!isAdmin && userId != null) {
            wrapper.eq(BookBorrow::getUserId, userId);
        }
        if (status != null) {
            wrapper.eq(BookBorrow::getStatus, status);
        }
        wrapper.orderByDesc(BookBorrow::getCreateTime);
        Page<BookBorrow> page = page(new Page<>(pageNum, pageSize), wrapper);

        Page<BookBorrowDTO> dtoPage = new Page<>(pageNum, pageSize);
        dtoPage.setTotal(page.getTotal());
        dtoPage.setRecords(page.getRecords().stream().map(this::toDTO).collect(Collectors.toList()));
        return dtoPage;
    }

    @Override
    @Transactional
    public void borrowBook(Long userId, Long bookId) {
        BookInfo book = bookInfoMapper.selectById(bookId);
        if (book == null) throw new RuntimeException("图书不存在");
        if (book.getStock() <= 0) throw new RuntimeException("库存不足");

        LambdaQueryWrapper<BookBorrow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BookBorrow::getUserId, userId)
                .eq(BookBorrow::getBookId, bookId)
                .eq(BookBorrow::getStatus, 1);
        long count = count(wrapper);
        if (count > 0) throw new RuntimeException("您已借阅此书，尚未归还");

        BookBorrow borrow = new BookBorrow();
        borrow.setUserId(userId);
        borrow.setBookId(bookId);
        borrow.setBorrowDate(LocalDateTime.now());
        borrow.setDueDate(LocalDateTime.now().plusDays(BORROW_DAYS));
        borrow.setRenewCount(0);
        borrow.setStatus(1);
        save(borrow);

        book.setStock(book.getStock() - 1);
        bookInfoMapper.updateById(book);

        SysUser user = userMapper.selectById(userId);
        if (user != null && user.getPhone() != null) {
            smsService.sendBorrowConfirmation(user.getPhone(), book.getBookName(),
                    borrow.getDueDate().toString());
        }
    }

    @Override
    @Transactional
    public void returnBook(Long borrowId, Long userId, boolean isAdmin) {
        BookBorrow borrow = getById(borrowId);
        if (borrow == null) throw new RuntimeException("借阅记录不存在");
        if (borrow.getStatus() != 1 && borrow.getStatus() != 3) {
            throw new RuntimeException("该书已归还");
        }
        if (!isAdmin && !borrow.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }

        borrow.setReturnDate(LocalDateTime.now());
        borrow.setStatus(2);
        updateById(borrow);

        BookInfo book = bookInfoMapper.selectById(borrow.getBookId());
        if (book != null) {
            book.setStock(book.getStock() + 1);
            bookInfoMapper.updateById(book);
        }
    }

    @Override
    @Transactional
    public void renewBook(Long borrowId, Long userId, boolean isAdmin) {
        BookBorrow borrow = getById(borrowId);
        if (borrow == null) throw new RuntimeException("借阅记录不存在");
        if (borrow.getStatus() != 1 && borrow.getStatus() != 3) {
            throw new RuntimeException("该书已归还，无法续借");
        }
        if (!isAdmin && !borrow.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }

        long totalDays = ChronoUnit.DAYS.between(borrow.getBorrowDate().toLocalDate(),
                borrow.getDueDate().toLocalDate()) + BORROW_DAYS;
        if (totalDays > MAX_RENEW_DAYS) {
            throw new RuntimeException("最多续借至" + MAX_RENEW_DAYS + "天，已达上限");
        }

        borrow.setDueDate(borrow.getDueDate().plusDays(BORROW_DAYS));
        borrow.setRenewCount(borrow.getRenewCount() + 1);
        borrow.setStatus(1);
        updateById(borrow);

        SysUser user = userMapper.selectById(borrow.getUserId());
        BookInfo book = bookInfoMapper.selectById(borrow.getBookId());
        if (user != null && book != null && user.getPhone() != null) {
            smsService.sendRenewalConfirmation(user.getPhone(), book.getBookName(),
                    borrow.getDueDate().toString());
        }
    }

    @Override
    public void checkOverdue() {
        LambdaQueryWrapper<BookBorrow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BookBorrow::getStatus, 1)
                .lt(BookBorrow::getDueDate, LocalDateTime.now());
        List<BookBorrow> overdueList = list(wrapper);
        for (BookBorrow borrow : overdueList) {
            borrow.setStatus(3);
            updateById(borrow);
            SysUser user = userMapper.selectById(borrow.getUserId());
            BookInfo book = bookInfoMapper.selectById(borrow.getBookId());
            if (user != null && book != null && user.getPhone() != null) {
                smsService.sendOverdueReminder(user.getPhone(), book.getBookName(),
                        borrow.getDueDate().toString());
            }
        }
    }

    private BookBorrowDTO toDTO(BookBorrow borrow) {
        BookBorrowDTO dto = new BookBorrowDTO();
        dto.setId(borrow.getId());
        dto.setUserId(borrow.getUserId());
        dto.setBookId(borrow.getBookId());
        dto.setBorrowDate(borrow.getBorrowDate());
        dto.setDueDate(borrow.getDueDate());
        dto.setReturnDate(borrow.getReturnDate());
        dto.setRenewCount(borrow.getRenewCount());
        dto.setStatus(borrow.getStatus());

        BookInfo book = bookInfoMapper.selectById(borrow.getBookId());
        if (book != null) {
            dto.setBookName(book.getBookName());
            dto.setAuthor(book.getAuthor());
        }
        SysUser user = userMapper.selectById(borrow.getUserId());
        if (user != null) {
            dto.setUsername(user.getUsername());
            dto.setNickname(user.getNickname());
        }
        return dto;
    }

    @Override
    public Map<String, Object> getBorrowSummary(Long userId) {
        LambdaQueryWrapper<BookBorrow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BookBorrow::getUserId, userId);
        List<BookBorrow> borrows = list(wrapper);

        long borrowing = borrows.stream().filter(b -> b.getStatus() == 1).count();
        long overdue = borrows.stream().filter(b -> b.getStatus() == 3).count();
        long returned = borrows.stream().filter(b -> b.getStatus() == 2).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("borrowing", borrowing);
        summary.put("overdue", overdue);
        summary.put("returned", returned);
        summary.put("total", borrows.size());
        return summary;
    }
}

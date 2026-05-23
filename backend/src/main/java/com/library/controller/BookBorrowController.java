package com.library.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.dto.BookBorrowDTO;
import com.library.dto.Result;
import com.library.entity.SysRole;
import com.library.entity.SysUserRole;
import com.library.mapper.SysRoleMapper;
import com.library.mapper.SysUserRoleMapper;
import com.library.service.BookBorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/book/borrow")
public class BookBorrowController {

    @Autowired
    private BookBorrowService borrowService;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired
    private SysRoleMapper roleMapper;

    @GetMapping("/list")
    public Result<Page<BookBorrowDTO>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        boolean isAdmin = isAdmin(userId);
        Long queryUserId = isAdmin ? null : userId;
        return Result.success(borrowService.pageList(pageNum, pageSize, queryUserId, status, isAdmin));
    }

    @PostMapping("/borrow")
    public Result<Void> borrow(@RequestParam Long bookId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        borrowService.borrowBook(userId, bookId);
        return Result.success("借阅成功", null);
    }

    @PutMapping("/return/{id}")
    public Result<Void> returnBook(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        boolean isAdmin = isAdmin(userId);
        borrowService.returnBook(id, userId, isAdmin);
        return Result.success("归还成功", null);
    }

    @PutMapping("/renew/{id}")
    public Result<Void> renew(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        boolean isAdmin = isAdmin(userId);
        borrowService.renewBook(id, userId, isAdmin);
        return Result.success("续借成功", null);
    }

    @PostMapping("/checkOverdue")
    public Result<Void> checkOverdue() {
        borrowService.checkOverdue();
        return Result.success("检查完成", null);
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> borrowSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        return Result.success(borrowService.getBorrowSummary(userId));
    }

    private boolean isAdmin(Long userId) {
        List<SysUserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>().eq(SysUserRole::getUserId, userId));
        List<Long> roleIds = userRoles.stream().map(SysUserRole::getRoleId).collect(Collectors.toList());
        if (roleIds.isEmpty()) return false;
        List<SysRole> roles = roleMapper.selectBatchIds(roleIds);
        return roles.stream().anyMatch(r -> "admin".equals(r.getRoleKey()));
    }
}

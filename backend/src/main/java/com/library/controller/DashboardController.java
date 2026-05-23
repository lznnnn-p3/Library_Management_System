package com.library.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.library.dto.DashboardStatsDTO;
import com.library.dto.Result;
import com.library.entity.SysRole;
import com.library.entity.SysUserRole;
import com.library.mapper.SysRoleMapper;
import com.library.mapper.SysUserRoleMapper;
import com.library.service.BookBorrowService;
import com.library.service.BookInfoService;
import com.library.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private BookInfoService bookInfoService;
    @Autowired
    private SysUserService userService;
    @Autowired
    private BookBorrowService borrowService;
    @Autowired
    private SysUserRoleMapper userRoleMapper;
    @Autowired
    private SysRoleMapper roleMapper;

    @GetMapping("/stats")
    public Result<DashboardStatsDTO> getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        boolean isAdmin = isAdmin(userId);

        DashboardStatsDTO.DashboardStatsDTOBuilder builder = DashboardStatsDTO.builder()
                .bookCount(bookInfoService.count())
                .categoryStats(bookInfoService.getCategoryStats())
                .borrowSummary(borrowService.getBorrowSummary(userId));

        if (isAdmin) {
            builder.userCount(userService.count())
                   .roleCount(roleMapper.selectCount(null));
        } else {
            builder.userCount(0).roleCount(0);
        }

        return Result.success(builder.build());
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

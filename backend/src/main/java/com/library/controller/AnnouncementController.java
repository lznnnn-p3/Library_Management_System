package com.library.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.dto.AnnouncementDTO;
import com.library.dto.Result;
import com.library.entity.Announcement;
import com.library.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/announcement")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping("/list")
    public Result<Page<Announcement>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer status) {
        return Result.success(announcementService.pageList(pageNum, pageSize, title, status));
    }

    @GetMapping("/latest")
    public Result<List<Announcement>> latest(@RequestParam(defaultValue = "3") int count) {
        return Result.success(announcementService.getLatest(count));
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody AnnouncementDTO dto) {
        announcementService.addAnnouncement(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@Valid @RequestBody AnnouncementDTO dto) {
        announcementService.updateAnnouncement(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return Result.success("删除成功", null);
    }
}

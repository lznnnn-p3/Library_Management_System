package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.AnnouncementDTO;
import com.library.entity.Announcement;
import com.library.mapper.AnnouncementMapper;
import com.library.service.AnnouncementService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AnnouncementServiceImpl extends ServiceImpl<AnnouncementMapper, Announcement> implements AnnouncementService {

    @Override
    public Page<Announcement> pageList(int pageNum, int pageSize, String title, Integer status) {
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(title)) {
            wrapper.like(Announcement::getTitle, title);
        }
        if (status != null) {
            wrapper.eq(Announcement::getStatus, status);
        }
        wrapper.orderByDesc(Announcement::getIsTop).orderByDesc(Announcement::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void addAnnouncement(AnnouncementDTO dto) {
        Announcement announcement = new Announcement();
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setIsTop(dto.getIsTop() != null ? dto.getIsTop() : 0);
        announcement.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        save(announcement);
    }

    @Override
    public void updateAnnouncement(AnnouncementDTO dto) {
        Announcement announcement = getById(dto.getId());
        if (announcement == null) throw new RuntimeException("公告不存在");
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        if (dto.getIsTop() != null) announcement.setIsTop(dto.getIsTop());
        if (dto.getStatus() != null) announcement.setStatus(dto.getStatus());
        updateById(announcement);
    }

    @Override
    public void deleteAnnouncement(Long id) {
        removeById(id);
    }

    @Override
    public java.util.List<Announcement> getLatest(int count) {
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Announcement::getStatus, 1)
               .orderByDesc(Announcement::getIsTop)
               .orderByDesc(Announcement::getCreateTime)
               .last("LIMIT " + count);
        return list(wrapper);
    }
}

package com.library.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.AnnouncementDTO;
import com.library.entity.Announcement;
import java.util.List;

public interface AnnouncementService extends IService<Announcement> {
    Page<Announcement> pageList(int pageNum, int pageSize, String title, Integer status);
    void addAnnouncement(AnnouncementDTO dto);
    void updateAnnouncement(AnnouncementDTO dto);
    void deleteAnnouncement(Long id);
    List<Announcement> getLatest(int count);
}

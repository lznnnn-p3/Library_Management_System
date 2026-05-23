package com.library.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.config.CacheConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    @Autowired
    private CacheConfig cacheConfig;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, CacheEntry> localCache = new ConcurrentHashMap<>();

    public void put(String key, Object value, long timeoutSeconds) {
        if (cacheConfig.isRedisEnabled()) {
            if (redisTemplate == null) {
                throw new RuntimeException("Redis is enabled but not configured");
            }
            redisTemplate.opsForValue().set(key, value, timeoutSeconds, TimeUnit.SECONDS);
            log.debug("Redis cache put: {}", key);
        } else {
            localCache.put(key, new CacheEntry(value, System.currentTimeMillis() + timeoutSeconds * 1000));
            log.debug("Local cache put: {}", key);
        }
    }

    public <T> T get(String key, Class<T> type) {
        if (cacheConfig.isRedisEnabled()) {
            if (redisTemplate == null) {
                throw new RuntimeException("Redis is enabled but not configured");
            }
            Object value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                return objectMapper.convertValue(value, type);
            }
            return null;
        }

        CacheEntry entry = localCache.get(key);
        if (entry != null && !entry.isExpired()) {
            return objectMapper.convertValue(entry.getValue(), type);
        }

        localCache.remove(key);
        return null;
    }

    public void evict(String key) {
        if (cacheConfig.isRedisEnabled()) {
            if (redisTemplate == null) {
                throw new RuntimeException("Redis is enabled but not configured");
            }
            redisTemplate.delete(key);
        } else {
            localCache.remove(key);
        }
    }

    private static class CacheEntry {
        private final Object value;
        private final long expireTime;

        CacheEntry(Object value, long expireTime) {
            this.value = value;
            this.expireTime = expireTime;
        }

        Object getValue() { return value; }
        boolean isExpired() { return System.currentTimeMillis() > expireTime; }
    }
}

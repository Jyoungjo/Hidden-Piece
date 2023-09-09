// 페이지가 로드될 때 댓글 UI 초기화
window.addEventListener('DOMContentLoaded', initCommentsUI);

// 댓글 UI 초기화 및 댓글 목록 표시
function initCommentsUI() {
    readAndDisplayComments();
}

// 개행 처리 포맷팅
function formatContent(content) {
    return content.replace(/\n/g, '<br>');
}

// 작성 일시 포맷팅
window.formatDateTime = formatDateTime;

function formatDateTime(createdAt, lastModifiedAt) {
    const createdAtDate = new Date(createdAt);
    const updatedAtDate = lastModifiedAt ? new Date(lastModifiedAt) : null;

    const formattedDate = createdAtDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const formattedTime = createdAtDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    let displayString = `${formattedDate} ${formattedTime}`;

    // 수정된 경우 "수정됨" 추가
    if (updatedAtDate && (createdAtDate.getTime() !== updatedAtDate.getTime())) {
        displayString += " (수정됨)";
    }

    return displayString;
}

// 댓글 템플릿 생성
function commentTemplate(comment) {
    const formattedContent = formatContent(comment.content);
    const formattedDateTime = formatDateTime(comment.createdAt, comment.lastModifiedAt);

    // 작성자의 일치 여부에 따른 수정 및 삭제 옵션 표시
    const commentActions = comment.isWriter ?
        `
    <li><a class="dropdown-item edit-comment-btn" href="#">수정</a></li>
    <li><a class="dropdown-item delete-comment-btn" href="#">삭제</a></li>
    ` : '';

    return `
        <div class="comment" data-id="${comment.id}">
            <div class="comment-align">
                <h7 class="comment-user">${comment.username}</h7>
                <small class="comment-date">${formattedDateTime}</small>
                <span class="reply-count"></span>
                <button class="btn btn-secondary btn-sm dropdown-toggle comment-dropdown" type="button" data-bs-toggle="dropdown"></button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item reply-comment-btn" href="#">답글</a></li>
                    ${commentActions}
                </ul>
            </div>
            <p>${formattedContent}</p>
        </div>
    `;
}

// 답글 템플릿 생성
function replyTemplate(reply) {
    const formattedDateTime = formatDateTime(reply.createdAt, reply.lastModifiedAt);

    // 작성자의 일치 여부에 따른 수정 및 삭제 옵션 표시
    const replyActions = reply.isWriter ?
        `
        <button class="btn btn-secondary btn-sm dropdown-toggle comment-dropdown" type="button" data-bs-toggle="dropdown"></button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item edit-reply-btn" href="#">수정</a></li>
            <li><a class="dropdown-item delete-reply-btn" href="#">삭제</a></li>
        </ul>
        ` : '';

    return `
        <div class="comment-reply" data-id="${reply.id}">
            <div class="comment-align">
                <h7 class="comment-user">${reply.username}</h7>
                <small class="comment-date">${formattedDateTime}</small>
                ${replyActions}
            </div>
            <p>${reply.content}</p>
        </div>
    `;
}

// 페이지에 댓글 추가
function addCommentToPage(comment) {
    const commentsContainer = document.querySelector(".comments");
    commentsContainer.insertAdjacentHTML('beforeend', commentTemplate(comment));
}

// 페이지에 답글 추가
function addReplyToPage(reply, parentCommentId) {
    console.log(reply);
    const parentCommentElement = document.querySelector(`.comment[data-id="${parentCommentId}"]`);
    parentCommentElement.insertAdjacentHTML('beforeend', replyTemplate(reply));
}

// 페이지에 댓글 및 답글 표시
function readAndDisplayComments() {
    const articleId = window.articleId;
    readComments(articleId, function(comments) {
        comments.forEach(function(comment) {
            addCommentToPage(comment);

            if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach(function(reply) {
                    addReplyToPage(reply, comment.id);
                });
                updateReplyCount(comment.id);
            } else {
                updateReplyCount(comment.id);
            }
            updateCommentCount();
        });
    });
}

// 전체 댓글 수 업데이트
function updateCommentCount() {
    const commentsContainer = document.querySelector(".comments");
    const commentElements = commentsContainer.querySelectorAll('.comment');

    const commentCountElement = document.getElementById('comment-count');
    commentCountElement.textContent = commentElements.length;
}

// 해당 댓글의 답글 수 업데이트
function updateReplyCount(commentId) {
    const commentElement = document.querySelector(`.comment[data-id="${commentId}"]`);
    if (!commentElement) return;

    const replyElements = commentElement.querySelectorAll('.comment-reply');
    const replyCountElement = commentElement.querySelector('.reply-count');

    if (replyCountElement) {
        if (replyElements.length > 0) {
            replyCountElement.textContent = `답글 [${replyElements.length}]`;
            replyCountElement.style.display = 'inline'
        } else {
            replyCountElement.style.display = 'none';
        }
    }
}
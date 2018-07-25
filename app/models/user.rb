# == Schema Information
#
# Table name: users
#
#  id              :uuid             not null, primary key
#  email           :string
#  first_name      :string
#  last_name       :string
#  password_digest :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  roles           :string           default([]), not null, is an Array
#  facebook_id     :string
#

class User < ApplicationRecord
  has_secure_password validations: false

  has_many :likes, dependent: :destroy
  has_many :events, through: :likes
  has_many :sessions, dependent: :destroy

  has_and_belongs_to_many :owned_events, class_name: "Event"
  has_and_belongs_to_many :owned_locations, class_name: "Location"

  scope :guest, -> { where(email: nil) }

  class << self
    def authenticate_facebook(token)
      response = HTTParty.get "https://graph.facebook.com/me", query: { fields: 'id,first_name,last_name,email', access_token: token }
      raise "facebook request error: #{response.code}" unless response.code == 200
      data = OpenStruct.new JSON.parse(response.body).symbolize_keys
      user = User.find_or_initialize_by facebook_id: data.id
      user.assign_attributes email: data.email, first_name: data.first_name, last_name: data.last_name
      user.save!
      user
    end
  end

  def migrate_to(user)
    likes.update_all user_id: user.id
  end

  def guest?
    email.blank? && facebook_id.blank?
  end

  def admin?
    roles.include? "admin"
  end

  def level
    return "admin" if admin?
    guest? ? "guest" : "user"
  end

  def name
    [first_name, last_name].presence.join(" ").presence
  end
end
